import { db, storage } from '@/lib/firebase';
import { collection, addDoc, Timestamp, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';

/**
 * Interface representing the structure of an Event.
 * Each event has properties such as title, dates, time, location, description, images, and other details.
 */
export interface Event {
  id?: string; 
  title: string; 
  startDate: string; 
  startTime: string; 
  endDate: string; 
  endTime: string; 
  location: string; 
  description: string; 
  images: string[]; 
  categories: string[]; 
  isPaid: boolean; 
  price: number;
  organizerWebsite?: string; 
  organizerPhone?: string; 
  createdBy: string; 
  status: 'draft' | 'published'; 
  isRecurring: boolean; 
  recurringDays: string[];
  recurringEndDate: string | null; 
  isAccessible: boolean; 
  hasParking: boolean; 
  hasPublicTransport: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Function to create a new event.
 * Adds the event details to Firestore and returns the document ID of the newly created event.
 * 
 * @param eventData - The details of the event to be created (excluding id, createdAt, and updatedAt)
 * @returns The ID of the newly created event document.
 */
export async function createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const eventRef = await addDoc(collection(db, 'events'), {
      ...eventData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return eventRef.id;
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    throw error;
  }
}

/**
 * Function to fetch all published events.
 * Queries Firestore to get events where the status is 'published'.
 * 
 * @returns A list of published events.
 */
export async function getAllEvents() {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, where('status', '==', 'published'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Event[];
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    throw error;
  }
}

/**
 * Function to fetch events created by a specific user.
 * Queries Firestore to get events where the 'createdBy' field matches the user's ID.
 * 
 * @param userId - The ID of the user whose events are to be fetched.
 * @returns A list of events created by the user.
 */
export async function getUserEvents(userId: string) {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, where('createdBy', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Event[];
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    throw error;
  }
}

/**
 * Function to update an existing event.
 * Updates the specified event document with new data.
 * 
 * @param eventId - The ID of the event to be updated.
 * @param eventData - The updated event data (some properties may be omitted).
 */
export async function updateEvent(eventId: string, eventData: Partial<Omit<Event, 'id' | 'createdAt' | 'createdBy'>>) {
  try {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      ...eventData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    throw error;
  }
}

/**
 * Function to delete an event and its associated resources.
 * Deletes the event document from Firestore, removes images from Firebase Storage,
 * and deletes any associated favorites.
 * 
 * @param eventId - The ID of the event to be deleted.
 */
export async function deleteEvent(eventId: string) {
  try {
    const storageRef = ref(storage, `events/${eventId}`);
    try {
      const imagesList = await listAll(storageRef);
      await Promise.all(
        imagesList.items.map(imageRef => deleteObject(imageRef))
      );
    } catch (error) {
      console.error('Erreur lors de la suppression des images:', error);
    }

    const eventRef = doc(db, 'events', eventId);
    await deleteDoc(eventRef);

    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('eventId', '==', eventId));
    const favoritesSnapshot = await getDocs(q);
    
    await Promise.all(
      favoritesSnapshot.docs.map(doc => deleteDoc(doc.ref))
    );
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    throw error;
  }
}

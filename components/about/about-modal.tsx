import { Users, GraduationCap, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

/**
 * Component for displaying an About Us modal.
 *
 * @param show - Boolean indicating if the modal should be displayed.
 * @param onClose - Function to handle closing the modal.
 */
export function AboutModal() {
  return (
    <Dialog>
      <DialogTrigger>
        <p className="text-gray-600 hover:text-primary transition-colors">
          À propos
        </p>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            À propos de nous
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <Users className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Notre équipe</h3>
              <p className="text-gray-600">
                Nous sommes une équipe de 4 étudiants passionnés par
                linformatique et le développement web. Actuellement en troisième
                et dernière année du BUT Informatique, nous mettons nos
                compétences au service de ce projet pour créer une plateforme
                d&apos;événements innovante et conviviale.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <GraduationCap className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Notre formation</h3>
              <p className="text-gray-600">
                Le BUT Informatique nous a permis d&apos;acquérir une solide
                formation en développement logiciel, gestion de projets et
                conception d&apos;applications. Cette dernière année est
                l&apos;occasion pour nous de mettre en pratique l&apos;ensemble
                de nos connaissances à travers ce projet concret.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Notre localisation</h3>
              <p className="text-gray-600">
                Nous étudions à l&apos;IUT de Nevers, un établissement qui nous
                offre un environnement propice à l&apos;apprentissage et à
                l&apos;innovation. La ville de Nevers, avec son dynamisme et sa
                qualité de vie, est un excellent cadre pour notre formation.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

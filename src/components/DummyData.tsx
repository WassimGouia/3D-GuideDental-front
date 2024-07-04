{
  /* MesFichier dummy data
Start
*/
}
import {
  Archive,
  Loader,
  UserCheck,
  LucideIcon,
  CheckCheck,
  NotepadText,
  Handshake,
  CircleDashed,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = {
  value: string;
  label: string;
  icon: LucideIcon;
};

export const statuses: Status[] = [
  { value: "Archivé", label: "Archivé", icon: Archive },
  {
    value: "En attente d'approbation",
    label: "En attente d'approbation",
    icon: Loader,
  },
  { value: "Soumis", label: "Soumis", icon: CheckCheck },
  {
    value: "En cours de modification",
    label: "En cours de modification",
    icon: CircleDashed,
  },
  { value: "Approuvé", label: "Approuvé", icon: UserCheck },
  { value: "Demande de devis", label: "Demande de devis", icon: NotepadText },
  {
    value: "Cas produit et expédié",
    label: "Cas produit et expédié",
    icon: Handshake,
  },
];

export const fichiers = [
  {
    Numero: "HR-1",
    Nom_patient: "Houssem",
    Date_ajout: "12/02/2024",

    type_travail: "Guide a étage",
    Etat: "soumis",
    ActionFaire: (
      <div className="justify-between space-x-2">
        <Button onClick={() => console.log("Button 1 clicked")}>
          Soumettre
        </Button>
        <Button onClick={() => console.log("Button 2 clicked")}>
          Supprimer
        </Button>
      </div>
    ),
  },

  {
    Numero: "HR-2",
    Nom_patient: "Houssem",

    Date_ajout: "12/02/2024",
    type_travail: "Autres services de conception",
    Etat: "soumis",
    ActionFaire: (
      <div className="justify-between space-x-2">
        <Button onClick={() => console.log("Button 1 clicked")}>
          Approuver
        </Button>
        <Button onClick={() => console.log("Button 2 clicked")}>
          Demande de modification
        </Button>
      </div>
    ),
  },

  {
    Numero: "HR-3",
    Nom_patient: "Houssem",

    Date_ajout: "12/02/2024",
    type_travail: "Gouttière de bruxisme",
    Etat: "soumis",
    ActionFaire: (
      <div className="justify-between space-x-2">
        <Button onClick={() => console.log("Button 1 clicked")}>
          Demande de devis
        </Button>
        <Button onClick={() => console.log("Button 2 clicked")}>
          Supprimer
        </Button>
      </div>
    ),
  },

  {
    Numero: "HR-4",
    Nom_patient: "Houssem",

    Date_ajout: "12/02/2024",
    type_travail: "Guide Classique",
    Etat: "Archivé",
    ActionFaire: (
      <div className="justify-between space-x-2">
        <Button onClick={() => console.log("Button 1 clicked")}>
          Soumettre
        </Button>
        <Button onClick={() => console.log("Button 2 clicked")}>
          Supprimer
        </Button>
      </div>
    ),
  },

  {
    Numero: "HR-5",
    Nom_patient: "Houssem",

    Date_ajout: "12/02/2024",
    type_travail: "Gouttière de bruxisme",
    Etat: "soumis",
    ActionFaire: (
      <div className="justify-between space-x-2">
        <Button onClick={() => console.log("Button 1 clicked")}>
          Button 1
        </Button>
        <Button onClick={() => console.log("Button 2 clicked")}>
          Button 2
        </Button>
      </div>
    ),
  },

  {
    Numero: "HR-6",
    Nom_patient: "Houssem",

    Date_ajout: "12/02/2024",
    type_travail: "Guide a étage",
    Etat: "soumis",
    ActionFaire: (
      <div className="justify-between space-x-2">
        <Button onClick={() => console.log("Button 1 clicked")}>
          Button 1
        </Button>
        <Button onClick={() => console.log("Button 2 clicked")}>
          Button 2
        </Button>
      </div>
    ),
  },

  {
    Numero: "HR-7",
    Nom_patient: "Mounir",

    Date_ajout: "12/02/2024",
    type_travail: "Guide pour gingivectomie",
    Etat: "En attente d'approbation",
    ActionFaire: (
      <div className="justify-between space-x-2">
        <Button onClick={() => console.log("Button 1 clicked")}>
          Button 1
        </Button>
        <Button onClick={() => console.log("Button 2 clicked")}>
          Button 2
        </Button>
      </div>
    ),
  },

  {
    Numero: "HR-8",
    Nom_patient: "Said",

    Date_ajout: "12/02/2024",
    type_travail: "Rapport radiologique",
    Etat: "soumis",
    ActionFaire: (
      <div className="justify-between space-x-2">
        <Button onClick={() => console.log("Button 1 clicked")}>
          Button 1
        </Button>
        <Button onClick={() => console.log("Button 2 clicked")}>
          Button 2
        </Button>
      </div>
    ),
  },

  {
    Numero: "HR-9",
    Nom_patient: "Houssem",

    Date_ajout: "12/02/2024",
    type_travail: "Autres services de conception",
    Etat: "En cours de modification",
    ActionFaire: (
      <div className="justify-between space-x-2">
        <Button onClick={() => console.log("Button 1 clicked")}>
          Button 1
        </Button>
        <Button onClick={() => console.log("Button 2 clicked")}>
          Button 2
        </Button>
      </div>
    ),
  },

  {
    Numero: "HR-10",
    Nom_patient: "Houssem",

    Date_ajout: "12/02/2024",
    type_travail: "Guide a étage",
    Etat: "soumis",
    ActionFaire: (
      <div className="justify-between space-x-2">
        <Button onClick={() => console.log("Button 1 clicked")}>
          Button 1
        </Button>
        <Button onClick={() => console.log("Button 2 clicked")}>
          Button 2
        </Button>
      </div>
    ),
  },

  {
    Numero: "HR-11",
    Nom_patient: "Houssem",

    Date_ajout: "12/02/2024",
    type_travail: "Guide a étage",
    Etat: "soumis",
    ActionFaire: (
      <div className="justify-between space-x-2">
        <Button onClick={() => console.log("Button 1 clicked")}>
          Button 1
        </Button>
        <Button onClick={() => console.log("Button 2 clicked")}>
          Button 2
        </Button>
      </div>
    ),
  },
  {
    Numero: "HR-12",
    Nom_patient: "Houssem",

    Date_ajout: "12/02/2024",
    type_travail: "Guide a étage",
    Etat: "soumis",
    ActionFaire: (
      <div className="justify-between space-x-2">
        <Button onClick={() => console.log("Button 1 clicked")}>
          Soumettre
        </Button>
        <Button onClick={() => console.log("Button 2 clicked")}>
          Supprimer
        </Button>
      </div>
    ),
  },
  {
    Numero: "HR-13",
    Nom_patient: "Houssem",

    Date_ajout: "12/02/2024",
    type_travail: "Rapport radiologique",
    Etat: "soumis",
    ActionFaire: (
      <div className="justify-between space-x-2">
        <Button onClick={() => console.log("Button 1 clicked")}>
          Soumettre
        </Button>
        <Button onClick={() => console.log("Button 2 clicked")}>
          Supprimer
        </Button>
      </div>
    ),
  },
  {
    Numero: "HR-14",
    Nom_patient: "Houssem",

    Date_ajout: "12/02/2024",
    type_travail: "Guide a étage",
    Etat: "soumis",
    ActionFaire: (
      <div className="justify-between space-x-2">
        <Button onClick={() => console.log("Button 1 clicked")}>
          Soumettre
        </Button>
        <Button onClick={() => console.log("Button 2 clicked")}>
          Supprimer
        </Button>
      </div>
    ),
  },
  {
    Numero: "HR-15",
    Nom_patient: "Houssem",
    Date_ajout: "12/02/2024",
    type_travail: "Rapport radiologique",
    Etat: "soumis",
    ActionFaire: (
      <div className="justify-between space-x-2">
        <Button onClick={() => console.log("Button 1 clicked")}>
          Soumettre
        </Button>
        <Button onClick={() => console.log("Button 2 clicked")}>
          Supprimer
        </Button>
      </div>
    ),
  },
];
{
  /* MesFichier dummy data
End
*/
}

{
  /* MesFichier dummy data
Start
*/
}
// export const guideEtage = [
// titre :  "Guide a étage",
// description: "Le guide à étage est une prothèse dentaire amovible qui permet de remplacer plusieurs dents manquantes. Elle est composée de deux étages : le premier étage en métal et le deuxième étage en résine. La prothèse est maintenue en bouche par des crochets métalliques qui s'accrochent aux dents restantes. Le guide à étage est une solution esthétique et économique pour remplacer plusieurs dents manquantes.",
{
  /* MesFichier dummy data
End
*/
}

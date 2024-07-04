import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Miniformm = () => {
  return (
    <div>
      <Card className="">
        <CardHeader className="items-center">
          <CardTitle>Mes informations</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            <p className="mt-4 mb-4">
              Un mail est nécéssaire pour s'inscrire à la plateforme, il servira
              en cas d'oubli de mot de passe.
            </p>
            <div className="mt-4 mb-4">
              <Label htmlFor="name">E-mail</Label>
              <Input id="E-mail" placeholder="E-mail (requis)" />
            </div>

            <div className="mt-4 mb-4">
              <Label htmlFor="name">Nom du cabinet</Label>
              <Input
                id="Nom de cabinet"
                placeholder="Nom du cabinet (requis)"
              />
            </div>
            <div className="mt-4 mb-4">
              <Label htmlFor="name">Siret</Label>
              <Input id="Siret" placeholder="Siret" />
            </div>

            <Separator />
            <div className="mt-4 mb-4">
              <Label htmlFor="name">Adresse</Label>
              <Input id="Adresse" placeholder="Adresse (requise)" />
            </div>
            <div className="mt-4 mb-4">
              <Label htmlFor="name">Bureau</Label>
              <Input id="Bureau" placeholder="App, bureau, local, etc.." />
            </div>
            <div className="mt-4 mb-4">
              <Label htmlFor="name">Code postal</Label>
              <Input id="Code postale" placeholder="Code postal (requis)" />
            </div>
            <div className="mt-4 mb-4">
              <Label htmlFor="name">Ville</Label>
              <Input id="Ville" placeholder="Ville (requise)" />
            </div>
            <div className="mt-4 mb-4">
              <Label htmlFor="name">Département</Label>
              <Input id="Département" placeholder="Département" />
            </div>
            <div className="mt-4 mb-4">
              <Label htmlFor="name">Pays</Label>
              <Input id="Pays" placeholder="Pays (requis)" />
            </div>
          </CardDescription>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>

      <div className="flex justify-between">
        <Button className="bg-[#0e0004] text-[#fffa1b] px-4 py-2 rounded-md mt-9">
          <Link to="/sign/information">Modifier</Link>
        </Button>
      </div>
    </div>
  );
};

export default Miniformm;

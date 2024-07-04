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
  const Minformm = () => {
    return (
      <div>
       
        <Card className="">
          <CardHeader className="items-center">
            <CardTitle >
              Login / Mot de passe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
            <div className="mt-4 mb-4">
              <Label htmlFor="name">Mot de passe actuel </Label>
              <Input id="Nom de cabinet" placeholder="Mot de passe actuel " />
            </div>
            <div className="mt-4 mb-4">
              <Label htmlFor="name">Nouveau mot de passe</Label>
              <Input id="Siret" placeholder="Nouveau mot de passe" />
            </div>
  
           
            <div className="mt-4 mb-4">
              <Label htmlFor="name">Nouveau mot de passe</Label>
              <Input id="Adresse" placeholder="Nouveau mot de passe (confirmation)" />
              <div className="flex justify-between">
                <Button className="bg-[#0e0004] text-[#fffa1b] px-4 py-2 rounded-md mt-9">
                <Link to="/sign/information">
                CHANGER LE MOT DE PASSE
                </Link>
              </Button>
              <Separator />
            </div>
            </div>
            <Separator />
            <p className="mt-4 mb-4">
                Un numéro de téléphone est nécessaire, il servira en cas de besoin
                de précisions sur une demande de modélisation urgente.
              </p>
            <div className="mt-4 mb-4">
              <Label htmlFor="name">Téléphone </Label>
              <Input id="Nom de cabinet" placeholder="Ajouter un numéro de téléphone  " />
            </div>
            </CardDescription>
          </CardContent>
          <CardFooter>
          </CardFooter>
        </Card>
        
       
      </div>
    );
  };
  
  export default Minformm;
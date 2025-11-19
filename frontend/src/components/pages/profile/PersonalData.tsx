import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";

interface PersonalDataProps {
  register: any;
}

const PersonalData = ({register}:PersonalDataProps) => {
  return (
    <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Informações Pessoais</CardTitle>
            <CardDescription>Atualize seus dados pessoais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-2 text-start">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                <div className="flex flex-col gap-y-2">
                  <div>Nome Completo:</div>
                  <input
                    {...register("name")}
                    placeholder="Fulana de tal"
                    className="border-2 border-secondary rounded-lg p-2 w-full text-foreground bg-background"
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <div>Apelido</div>
                  <input
                    {...register("nickname")}
                    placeholder="Como prefere ser chamado?"
                    className="border-2 border-secondary rounded-lg p-2 w-full text-foreground bg-background"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 w-full">
                <div>E-mail:</div>
                <input
                  {...register("email")}
                  placeholder="fulaninha@email.com"
                  className="border-2 border-secondary rounded-lg p-2 w-full text-foreground bg-background"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 w-full">
                <div>Biografia:</div>
                <textarea
                  {...register("bio")}
                  placeholder="Conte um pouco sobre você e suas preferências literárias..."
                  className="border-2 border-secondary rounded-lg p-2 w-full min-h-30 text-foreground bg-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>
  );
}

export default PersonalData;
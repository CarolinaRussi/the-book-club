import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import Profile from "../components/pages/me/Profile";
import MyReadings from "../components/pages/me/MyReadings";

export default function Me() {
  return (
    <div className="flex flex-col w-full max-w-7xl py-5 md:py-15 px-4 mx-auto">
      <div className="flex flex-col">
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="my-readings">Minhas Leituras</TabsTrigger>
            <TabsTrigger value="my-clubs">Meus Clubes</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Profile />
          </TabsContent>
          <TabsContent value="my-readings">
            <MyReadings />
          </TabsContent>
          <TabsContent value="my-clubs">
            <div>teste3</div>
          </TabsContent>
          <TabsContent value="settings">
            <div>teste4</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

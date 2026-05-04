import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import Profile from "../components/pages/me/Profile";
import MyReadings from "../components/pages/me/MyReadings";
import MyClubs from "../components/pages/me/MyClubs";
import Settings from "../components/pages/me/Settings";

const tabTriggerMobile =
  "min-h-[3rem] w-full whitespace-normal px-2 py-2 text-center text-sm leading-snug md:min-h-0 md:w-auto md:whitespace-nowrap md:px-5 md:py-1 md:text-1xl";

export default function Me() {
  return (
    <div className="flex flex-col w-full max-w-7xl py-5 md:py-15 px-4 mx-auto">
      <div className="flex w-full flex-col">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1.5 p-1.5 md:inline-flex md:h-10 md:w-fit md:flex-nowrap md:items-center md:justify-center md:gap-0 md:p-[3px]">
            <TabsTrigger className={tabTriggerMobile} value="profile">
              Perfil
            </TabsTrigger>
            <TabsTrigger className={tabTriggerMobile} value="my-readings">
              Minhas Leituras
            </TabsTrigger>
            <TabsTrigger className={tabTriggerMobile} value="my-clubs">
              Meus Clubes
            </TabsTrigger>
            <TabsTrigger className={tabTriggerMobile} value="settings">
              Configurações
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Profile />
          </TabsContent>
          <TabsContent value="my-readings">
            <MyReadings />
          </TabsContent>
          <TabsContent value="my-clubs">
            <MyClubs />
          </TabsContent>
          <TabsContent value="settings">
            <Settings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

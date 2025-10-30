import { Outlet } from "react-router";
import Header from "../Header";
import { Container } from "../Container";

export function Layout() {
  return (
    <>
      <Header />
      <Container>
        <Outlet />
      </Container>
    </>
  );
}

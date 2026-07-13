import { Outlet } from "react-router";
import Header from "../Header";
import { Container } from "../Container";
import { FeedbackWidget } from "../FeedbackWidget";

export function Layout() {
  return (
    <>
      <Header />
      <Container>
        <Outlet />
      </Container>
      <FeedbackWidget />
    </>
  );
}

import { Outlet } from "react-router";
import Header from "../Header";
import { Container } from "../Container";
import { FeedbackWidget } from "../FeedbackWidget";
import ReadingDrawActiveBanner from "../pages/reading-draw/ReadingDrawActiveBanner";

export function Layout() {
  return (
    <>
      <Header />
      <Container>
        <ReadingDrawActiveBanner />
        <Outlet />
      </Container>
      <FeedbackWidget />
    </>
  );
}

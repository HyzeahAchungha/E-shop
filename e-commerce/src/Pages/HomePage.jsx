import Hero               from "../component/sections/Hero";
import BestSellers        from "../component/sections/BestSellers";
import Collection         from "../component/sections/Collection";
import Modiweek           from "../component/sections/Modiweek";
import SustainabilityBanner from "../component/sections/SustainabilityBanner";
import SocialFeed         from "../component/sections/SocialFeed";
import NewsletterSignup   from "../component/sections/NewsletterSignup";

const Divider = () => (
  <div style={{ margin: "0 48px", borderTop: "0.5px solid #e8e5e0" }} />
);

export default function HomePage() {
  return (
    <>
      <Hero />
      <BestSellers />
      <Divider />
      <Collection />
      <Divider />
      <Modiweek />
      <SustainabilityBanner />
      <SocialFeed />
      <NewsletterSignup />
    </>
  );
}
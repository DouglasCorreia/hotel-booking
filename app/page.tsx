import { Suspense } from "react";
import { SearchForm } from "@/features/search/_components/search-form";
import { HomeContent } from "./_components/home-content";

export default function Home() {
  return (
    <>
      <section className="home-intro container">
        <div className="intro-copy">
          <p className="eyebrow">Sua viagem, no seu tempo</p>
          <h1>
            Encontre seu
            <br />
            próximo lugar.
          </h1>
          <p>
            Da energia da cidade à tranquilidade da serra.
            <br className="desktop-link" /> Uma boa estadia faz parte da viagem.
          </p>
        </div>
        <span className="intro-aside">
          Novos lugares.
          <br />
          Boas histórias.
        </span>
      </section>
      <div className="container home-search">
        <Suspense>
          <SearchForm />
        </Suspense>
        <p className="search-note">
          Escolha seu destino, encontre sua acomodação e experimente uma reserva
          sem cobrança.
        </p>
      </div>
      <HomeContent />
    </>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-ivory px-6 text-center">
      <div>
        <p className="font-display text-[8rem] leading-none text-petrol/15">404</p>
        <h1 className="display-md -mt-6 text-petrol">Esta página não foi encontrada.</h1>
        <p className="mt-3 text-ink/60">O endereço pode ter mudado ou o registro não existe mais.</p>
        <Link href="/" className="mt-8 inline-flex h-12 items-center rounded-full bg-petrol px-6 font-semibold text-ivory">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}

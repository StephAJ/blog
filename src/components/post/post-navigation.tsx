import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

type Neighbour = { title: string; slug: string } | null;

export function PostNavigation({
  previous,
  next,
}: {
  previous: Neighbour;
  next: Neighbour;
}) {
  if (!previous && !next) return null;

  return (
    <nav aria-label="Post navigation" className="grid gap-4 sm:grid-cols-2">
      {previous ? (
        <Link
          href={`/${previous.slug}`}
          rel="prev"
          className="card-hover group rounded-xl border hairline surface p-5"
        >
          <span className="eyebrow flex items-center gap-1.5 text-faint">
            <ArrowLeft size={13} /> Previous
          </span>
          <p className="clamp-2 mt-2 font-bold transition group-hover:text-accent">
            {previous.title}
          </p>
        </Link>
      ) : (
        <span />
      )}

      {next && (
        <Link
          href={`/${next.slug}`}
          rel="next"
          className="card-hover group rounded-xl border hairline surface p-5 sm:text-right"
        >
          <span className="eyebrow flex items-center gap-1.5 text-faint sm:justify-end">
            Next <ArrowRight size={13} />
          </span>
          <p className="clamp-2 mt-2 font-bold transition group-hover:text-accent">
            {next.title}
          </p>
        </Link>
      )}
    </nav>
  );
}

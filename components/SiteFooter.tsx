export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-8 text-sm sm:flex-row sm:justify-between sm:px-6">
        <p className="text-muted-foreground">
          <span className="font-display font-semibold text-foreground">
            MillionDollar
          </span>{" "}
          — pay your way to #1
        </p>
        <p className="text-muted-foreground">
          Built by{" "}
          <a
            href="https://x.com/MunemulTalha"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            @MunemulTalha
          </a>
          {" · "}
          Brought to you by{" "}
          <a
            href="https://pixheads.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            pixheads.com
          </a>
        </p>
      </div>
    </footer>
  );
}

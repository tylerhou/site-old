import type { PropsWithChildren } from "react";

import maincss from "./main-scss.ts";

interface BasePageProps {
  title: string;
}

function BasePage({ title, children }: PropsWithChildren<BasePageProps>) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: maincss }} />
      <link rel="stylesheet" href="https://use.typekit.net/irw4wry.css"></link>
      <title>{title}</title>
      {children}
    </>
  );
}

export default BasePage;

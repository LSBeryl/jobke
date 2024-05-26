import Articles from "../(page)/articles";
import Auth from "../(page)/auth";
import Note from "../(page)/note";
import Plan from "../(page)/plan";
import Write from "../(page)/write";
import NotFound from "../not-found";

export default function Page({ params: { page } }) {
  switch (page) {
    case "note":
      return <Note />;
    case "plan":
      return <Plan />;
    case "auth":
      return <Auth />;
    case "articles":
      return <Articles />;
    case "write":
      return <Write />;
    default:
      return <NotFound />;
  }
}

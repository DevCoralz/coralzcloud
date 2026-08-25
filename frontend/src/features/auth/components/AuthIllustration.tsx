import cloud from "@/assets/layer-cloud.png";
import folder from "@/assets/layer-folder.png";
import doc from "@/assets/layer-doc.png";
import photo from "@/assets/layer-photo.png";

/** Cloud upload scene used at the top of the auth pages. */
export function AuthIllustration() {
  return (
    <div className="relative mx-auto aspect-[16/11] w-full max-w-[19rem]">
      <img
        src={cloud}
        alt="Files uploading to the Coralz Cloud"
        width={420}
        height={320}
        className="absolute left-[24%] top-0 w-[52%] animate-float-slow"
      />

      <img
        src={photo}
        alt=""
        aria-hidden="true"
        className="absolute bottom-[2%] left-[8%] w-[24%] animate-float-soft"
        style={{ animationDelay: "0.4s" }}
      />
      <img
        src={doc}
        alt=""
        aria-hidden="true"
        className="absolute bottom-0 left-[38%] w-[24%] animate-float-soft"
        style={{ animationDelay: "1.5s" }}
      />
      <img
        src={folder}
        alt=""
        aria-hidden="true"
        className="absolute bottom-[3%] right-[8%] w-[25%] animate-float-soft"
        style={{ animationDelay: "2.2s" }}
      />
    </div>
  );
}

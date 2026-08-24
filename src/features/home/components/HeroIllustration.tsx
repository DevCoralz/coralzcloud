import cloud from "@/assets/layer-cloud.png";
import folder from "@/assets/layer-folder.png";
import doc from "@/assets/layer-doc.png";
import photo from "@/assets/layer-photo.png";
import video from "@/assets/layer-video.png";
import disc from "@/assets/layer-disc.png";

const dots = [
  { x: "38%", y: "4%", size: 9, delay: "0s" },
  { x: "66%", y: "10%", size: 8, delay: "1.1s" },
  { x: "86%", y: "17%", size: 7, delay: "2.2s" },
  { x: "4%", y: "31%", size: 10, delay: "0.6s" },
  { x: "22%", y: "42%", size: 8, delay: "1.7s" },
  { x: "92%", y: "45%", size: 8, delay: "0.9s" },
  { x: "10%", y: "70%", size: 8, delay: "2.6s" },
  { x: "84%", y: "70%", size: 11, delay: "1.4s" },
];

export function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-[10/9] w-full max-w-[26rem] sm:max-w-[30rem]">
      {dots.map((d, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="absolute rounded-full bg-primary/45 animate-drift"
          style={{
            left: d.x,
            top: d.y,
            width: d.size,
            height: d.size,
            animationDelay: d.delay,
          }}
        />
      ))}

      <img
        src={disc}
        alt=""
        aria-hidden="true"
        className="absolute left-[27%] top-[62%] w-[46%] opacity-60"
      />

      {/* upload trails */}
      {["32%", "44%", "56%"].map((left, i) => (
        <span
          key={left}
          aria-hidden="true"
          className="absolute top-[45%] h-[16%] w-px animate-float-soft border-l-2 border-dashed border-primary/35"
          style={{ left, animationDelay: `${i * 0.5}s` }}
        />
      ))}

      <img
        src={folder}
        alt=""
        aria-hidden="true"
        className="absolute left-[4%] top-[4%] w-[23%] animate-float-soft"
        style={{ animationDelay: "0.4s" }}
      />
      <img
        src={doc}
        alt=""
        aria-hidden="true"
        className="absolute right-[3%] top-[12%] w-[19%] animate-float-soft"
        style={{ animationDelay: "1.6s" }}
      />
      <img
        src={photo}
        alt=""
        aria-hidden="true"
        className="absolute left-[2%] top-[46%] w-[21%] animate-float-soft"
        style={{ animationDelay: "2.1s" }}
      />
      <img
        src={video}
        alt=""
        aria-hidden="true"
        className="absolute right-[2%] top-[55%] w-[19%] animate-float-soft"
        style={{ animationDelay: "1.1s" }}
      />
      <img
        src={cloud}
        alt="Files uploading to the Coralz Cloud"
        width={540}
        height={440}
        className="absolute left-[26%] top-[15%] w-[50%] animate-float-slow"
      />
    </div>
  );
}

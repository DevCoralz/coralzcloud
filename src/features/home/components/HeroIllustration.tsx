import cloud from "@/assets/layer-cloud.png";
import folder from "@/assets/layer-folder.png";
import doc from "@/assets/layer-doc.png";
import photo from "@/assets/layer-photo.png";
import video from "@/assets/layer-video.png";
import disc from "@/assets/layer-disc.png";

const ORBIT_DURATION = 30;

const orbiters = [
  { src: folder, size: "23%", angle: 0 },
  { src: doc, size: "19%", angle: 90 },
  { src: photo, size: "21%", angle: 180 },
  { src: video, size: "19%", angle: 270 },
];

export function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[26rem] sm:max-w-[30rem]">
      <img
        src={disc}
        alt=""
        aria-hidden="true"
        className="absolute left-1/2 top-[58%] w-[46%] -translate-x-1/2 opacity-60"
      />

      <img
        src={cloud}
        alt="Files uploading to the Coralz Cloud"
        width={540}
        height={440}
        className="absolute left-1/2 top-1/2 w-[50%] -translate-x-1/2 -translate-y-1/2 animate-float-slow"
      />

      {orbiters.map((item, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="absolute inset-0 animate-orbit"
          style={{
            animationDelay: `-${(item.angle / 360) * ORBIT_DURATION}s`,
          }}
        >
          <div
            className="absolute left-1/2 top-0 -translate-x-1/2 animate-orbit-counter"
            style={{
              width: item.size,
              animationDelay: `-${(item.angle / 360) * ORBIT_DURATION}s`,
            }}
          >
            <img src={item.src} alt="" className="w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

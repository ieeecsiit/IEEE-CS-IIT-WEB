import { Container, SectionTitle } from "./container";
import { Reveal } from "./reveal";
import { SiteImage } from "./site-image";

const paragraph = "text-[22px] leading-7 font-normal text-black xl:font-medium";
const missionImage = "w-[240px] rounded-[10px] xl:self-stretch xl:object-cover max-xs:mt-5 max-xs:w-full";
const heading = "my-0 flex-none text-[40px] leading-10 font-extralight uppercase";

export function WhoWeAre() {
  return (
    <section className="pt-[150px]">
      <Container>
        <SectionTitle>who we are</SectionTitle>
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1 max-md:gap-[60px]">
          <Reveal from="left">
            <div className="mb-[30px] flex items-center text-black">
              <SiteImage src="/images/plus.webp" alt="" sizes="70px" className="w-[70px]" />
              <h4 className={`${heading} ml-[30px]`}>
                Our
                <br />
                Mission
              </h4>
            </div>
            <div className="flex items-center rounded-[10px] border border-line p-2.5 max-xs:block">
              <div className="flex flex-col">
                <p className={`${paragraph} mb-[100px] xl:mt-5 xl:mb-[130px] xl:ml-5 max-xs:mb-5`}>
                  &quot;To foster technological innovation and excellence for the benefit of humanity by advancing the
                  theory, practice, and application of computer and information processing science and technology.&quot;
                </p>
                <div className="size-[30px] self-start rounded-[5px] border border-brand bg-brand xl:mb-5 xl:ml-5" />
              </div>
              <SiteImage
                src="/images/webspire2-0/webspire2-1.webp"
                alt=""
                sizes="(max-width: 479px) 100vw, 240px"
                className={`${missionImage} ml-10 xl:ml-5 max-xs:ml-0`}
              />
            </div>
          </Reveal>
          <Reveal from="right">
            <div className="mb-[30px] flex items-center justify-end text-black">
              <h4 className={`${heading} mr-[30px] text-right`}>
                Our
                <br />
                vision
              </h4>
              <SiteImage src="/images/plus.webp" alt="" sizes="70px" className="w-[70px]" />
            </div>
            <div className="flex items-center rounded-[10px] border border-line p-2.5 max-xs:block">
              <SiteImage
                src="/images/stackmedium/home-our-vision-2.webp"
                alt=""
                sizes="(max-width: 479px) 100vw, 240px"
                className={`${missionImage} xl:mr-5`}
              />
              <div className="flex flex-col">
                <div className="mt-5 ml-5 size-[30px] self-start rounded-[5px] border border-brand xl:mb-5 max-xs:ml-0" />
                <p className={`${paragraph} mt-[100px] ml-5 xl:mt-[130px] xl:mb-5 max-xs:mt-2.5 max-xs:ml-0`}>
                  &quot;To be the leading provider of technical information, community services, and personalized services
                  to the world&apos;s computing professionals.&quot;
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

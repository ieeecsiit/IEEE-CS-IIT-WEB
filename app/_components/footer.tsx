import { Container } from "./container";
import { Reveal } from "./reveal";
import { SiteImage } from "./site-image";

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/ieee-computer-society-student-chapter-of-iit" },
  { label: "Instagram", href: "https://www.instagram.com/ieeecs_iit" },
  { label: "facebook", href: "https://www.facebook.com/share/16K7UtsrNt/" },
  { label: "Tiktok", href: "https://www.tiktok.com/@ieeecsiit?_t=ZS-8vAbuJD2Pqq&_r=1" },
  { label: "youtube", href: "https://youtube.com/@ieeecomputersocietystudent5208?si=FMP4zc71sFfDqy-Z" },
];

export function Footer() {
  return (
    <footer className="mt-[50px]">
      <Container>
        <div className="rounded-[5px] border border-b-[15px] border-line py-[110px] text-center max-xs:py-[60px]">
          <Reveal from="left" className="inline-block">
            <a href="mailto:ieeecs@iit.ac.lk" className="text-[36px] text-black max-xs:text-[28px]">
              ieeecs@iit.ac.lk
            </a>
          </Reveal>
          <Reveal
            from="right"
            className="my-[30px] text-[60px] leading-[50px] font-normal text-black max-sm:text-[50px] max-xs:text-[34px] max-xs:leading-10"
          >
            Connect with Us
          </Reveal>
          <Reveal from="bottom" className="flex justify-center max-sm:flex-col max-sm:items-center">
            {socials.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group mr-5 flex items-center text-black last:mr-0 max-sm:mr-0 max-sm:mb-5"
              >
                <span className="text-lg leading-[18px] capitalize underline">{label}</span>
                <SiteImage
                  src="/images/arrow-down-right.webp"
                  alt=""
                  sizes="30px"
                  className="ml-2.5 w-[30px] transition-transform duration-300 group-hover:-rotate-90"
                />
              </a>
            ))}
          </Reveal>
        </div>
        <div className="flex items-center justify-between py-[30px] max-sm:block">
          <Reveal from="left" className="text-black max-xs:pr-5">
            IEEE Computer Society SBC of IIT - © {new Date().getFullYear()}
          </Reveal>
        </div>
      </Container>
    </footer>
  );
}

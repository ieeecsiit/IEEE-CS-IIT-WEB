import type { TeamMember } from "@/app/_data/types";
import { SiteImage } from "./site-image";

function SocialLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group/social flex size-[38px] items-center justify-center rounded-full bg-white shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition duration-300 hover:scale-115 hover:rotate-5 hover:bg-brand hover:shadow-[0_6px_15px_rgba(255,163,0,0.4)]"
    >
      <SiteImage src={icon} alt="" sizes="18px" className="size-[18px] group-hover/social:brightness-0 group-hover/social:invert" />
    </a>
  );
}

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="group flex min-w-[280px] flex-[0_1_calc(33.333%-30px)] flex-col transition-transform duration-300 hover:-translate-y-2.5 max-md:flex-[0_1_calc(50%-30px)] max-[600px]:flex-[0_1_100%]">
      <div className="relative overflow-hidden rounded-[15px] border border-black/5 bg-white px-[30px] pt-10 shadow-[0_10px_30px_rgba(0,0,0,0.05)] max-[600px]:px-5 max-[600px]:pt-[30px]">
        <SiteImage
          src={member.image}
          alt={member.name}
          sizes="(max-width: 600px) 100vw, 400px"
          className="aspect-square w-full rounded-t-[10px] object-cover grayscale-20 transition-[filter] duration-300 group-hover:grayscale-0"
        />
        <div className="absolute top-[15px] right-[15px] flex translate-x-2.5 flex-col gap-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          <SocialLink href={member.linkedin} icon="/images/linkedin.webp" label={`${member.name} on LinkedIn`} />
          <SocialLink href={`mailto:${member.email}`} icon="/images/email.webp" label={`Email ${member.name}`} />
        </div>
      </div>
      <div className="px-2.5 py-[25px] text-center">
        <h4 className="m-0 text-[22px] leading-[1.2] font-bold text-[#1a1a1a]">{member.name}</h4>
        <div className="mt-2 text-sm font-medium tracking-[1px] text-[#666] uppercase">{member.role}</div>
      </div>
    </div>
  );
}

export function TeamGroup({ title, members }: { title: string; members: TeamMember[] }) {
  return (
    <>
      <h2 className="relative mb-[60px] pb-5 text-center text-[clamp(32px,5vw,42px)] font-bold tracking-[2px] text-[#1a1a1a] uppercase after:absolute after:bottom-0 after:left-1/2 after:h-1 after:w-20 after:-translate-x-1/2 after:rounded-sm after:bg-brand">
        {title}
      </h2>
      <div className="flex w-full flex-wrap justify-center gap-x-[30px] gap-y-10">
        {members.map((member) => (
          <TeamCard key={member.name} member={member} />
        ))}
      </div>
    </>
  );
}

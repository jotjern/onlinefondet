import Member from '../components/about_us/Members';
import Accordion from '../components/about_us/Accordion';
import Title from '../components/appliance/Title';
import { HorizontalLine } from '../components/appliance/HorizontalLine';
import { aboutUsText, currentMembers, pastMembers } from '../content';

export default function OmOssPage() {
  return (
    <div className="text-[40px] text-center">
      <div className="relative w-full p-12 m-auto md:w-4/5">
        <Title title="Om Oss" />
        <HorizontalLine />
        <p className="overflow-hidden text-xl leading-9 text-left">
          {aboutUsText}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center flex-grow gap-12 p-0 md:flex-row flex-nowrap md:flex-wrap md:p-12">
        {currentMembers.map((member) => (
          <Member path={member.image} name={member.name} />
        ))}
      </div>
      <div className="relative w-4/6 m-auto">
        <h1>Tidligere medlemmer</h1>
        <div>
          {pastMembers.map((member) => (
            <Accordion title={member.year} content={member.members} />
          ))}
        </div>
      </div>
    </div>
  );
}

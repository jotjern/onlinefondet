import Table from '../components/graphs/Table';
import Splash from '../components/home/Splash';
import ScrollDownIcon from '../components/home/ScrollDownIcon';
import PieChart from '../components/graphs/PieChart';
import PerformanceDisplay from '../components/graphs/PerformanceDisplay';
import { homeText } from '../content';

const HomePage = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <div className="hidden md:block">
      <Splash />
      <ScrollDownIcon />
    </div>
    <h1 className="mb-2 text-2xl md:hidden">Online Fondet</h1>
    <div className="w-3/4 mb-10 text-lg text-justify">{homeText}</div>
    <PerformanceDisplay />
    <div className="hidden w-full mb-10 md:block">
      <div className="w-full mt-40 mb-10 text-lg text-center">
        Denne smultringen gir en oversikt over fondets sammensetning (FAKE DATA)
      </div>
      <PieChart />
    </div>
    <div className="w-3/4 mt-40">
      <div className="mb-10 text-lg text-center">
        Tabellen viser fond, andel og kategori (FAKE DATA)
      </div>
      <Table />
    </div>
  </div>
);

export default HomePage;
// import { getTechLogos } from "@/lib/utils"
// import Image from "next/image";
// import React from 'react'
// // import { cn } from "@/lib/utils";
// import { useEffect, useState } from "react";

// const DisplayTechIcons = async ({ techStack }: TechIconProps) => {

//   const techIcons = await getTechLogos(techStack);

//   return (
//     <div className="flex flex-row">
//         {techIcons.slice(0, 3).map(({ tech, url }, index) => (
//             <div 
//                 key={tech} 
//                 // className={cn("relative group bg-dark-300 rounded-full p-2 flex-center", index >= 1 && "-ml-3")}
//                 className={"relative group bg-dark-300 rounded-full p-2 flex-center ml-2"}
//             >
//                 <span className="tech-tooltip">{tech}</span>
//                 <Image src={url} alt="tech" width={100} height={100} className="size-5" />
//             </div>
//         ))}
//     </div>
//   )
// }

// export default DisplayTechIcons
import Image from "next/image";
import React from "react";

type TechIcon = {
  tech: string;
  url: string;
};

const DisplayTechIcons = ({ techIcons }: { techIcons: TechIcon[] }) => {
  return (
    <div className="flex flex-row">
      {techIcons.slice(0, 3).map(({ tech, url }: TechIcon, index: number) => (
        <div
          key={tech}
          className={`relative group bg-dark-300 rounded-full p-2 flex-center ${
            index !== 0 ? "-ml-3" : ""
          }`}
        >
          <span className="tech-tooltip">{tech}</span>
          <Image src={url} alt="tech" width={100} height={100} className="size-5" />
        </div>
      ))}
    </div>
  );
};

export default DisplayTechIcons;
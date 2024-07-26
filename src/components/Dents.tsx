import React, { useEffect, useState } from "react";
import dent11 from "@/assets/dents/11.png";
import dent12 from "@/assets/dents/12.png";
import dent13 from "@/assets/dents/13.png";
import dent14 from "@/assets/dents/14.png";
import dent15 from "@/assets/dents/15.png";
import dent16 from "@/assets/dents/16.png";
import dent17 from "@/assets/dents/17.png";
import dent18 from "@/assets/dents/18.png";
import dent41 from "@/assets/dents/41.png";
import dent42 from "@/assets/dents/42.png";
import dent43 from "@/assets/dents/43.png";
import dent44 from "@/assets/dents/44.png";
import dent45 from "@/assets/dents/45.png";
import dent46 from "@/assets/dents/46.png";
import dent47 from "@/assets/dents/47.png";
import dent48 from "@/assets/dents/48.png";


interface DentsProps {
  selectAll: boolean;
  onToothClick?: (index: number) => void;
  onTeethSelectionChange?: (selectedTeeth: number[]) => void;
  selectedTeethData: number[];
  isReadOnly?: boolean;
}

interface Images {
  image: string;
  index: number;
}

const Dents: React.FC<DentsProps> = ({
  selectAll,
  onToothClick,
  selectedTeethData,
  onTeethSelectionChange,
  isReadOnly = false,
}) => {
  const [selectedImagesUp, setSelectedImagesUp] = useState<number[]>([]);
  const [selectedImagesDown, setSelectedImagesDown] = useState<number[]>([]);

  useEffect(() => {
    setSelectedImagesUp(selectedTeethData.filter((index) => index <= 28));
    setSelectedImagesDown(selectedTeethData.filter((index) => index >= 31));
  }, [selectedTeethData]);

  const isSelected = (index: number) =>
    selectedImagesUp.includes(index) || selectedImagesDown.includes(index);

  const isUpperArchDisabled = selectedImagesDown.length > 0;
  const isLowerArchDisabled = selectedImagesUp.length > 0;

  const handleClick = (index: number, isUpper: boolean) => {
    if (isReadOnly) return;
    if ((isUpper && isUpperArchDisabled) || (!isUpper && isLowerArchDisabled))
      return;

    let newSelectedImagesUp = [...selectedImagesUp];
    let newSelectedImagesDown = [...selectedImagesDown];

    if (isUpper) {
      if (selectAll) {
        newSelectedImagesUp = selectedImagesUp.includes(index)
          ? []
          : imgsUp.map((img) => img.index);
      } else {
        if (selectedImagesUp.includes(index)) {
          newSelectedImagesUp = selectedImagesUp.filter((i) => i !== index);
        } else {
          newSelectedImagesUp = [...selectedImagesUp, index];
        }
      }
      setSelectedImagesUp(newSelectedImagesUp);
    } else {
      if (selectAll) {
        newSelectedImagesDown = selectedImagesDown.includes(index)
          ? []
          : imgsDown.map((img) => img.index);
      } else {
        if (selectedImagesDown.includes(index)) {
          newSelectedImagesDown = selectedImagesDown.filter((i) => i !== index);
        } else {
          newSelectedImagesDown = [...selectedImagesDown, index];
        }
      }
      setSelectedImagesDown(newSelectedImagesDown);
    }

    if (onToothClick) onToothClick(index);

    const newSelectedTeeth = [...newSelectedImagesUp, ...newSelectedImagesDown];
    onTeethSelectionChange?.(newSelectedTeeth);
  };

  const imgsUp: Images[] = [
    { image: dent18, index: 18 },
    { image: dent17, index: 17 },
    { image: dent16, index: 16 },
    { image: dent15, index: 15 },
    { image: dent14, index: 14 },
    { image: dent13, index: 13 },
    { image: dent12, index: 12 },
    { image: dent11, index: 11 },
    { image: dent11, index: 21 },
    { image: dent12, index: 22 },
    { image: dent13, index: 23 },
    { image: dent14, index: 24 },
    { image: dent15, index: 25 },
    { image: dent16, index: 26 },
    { image: dent17, index: 27 },
    { image: dent18, index: 28 },
  ];

  const imgsDown: Images[] = [
    { image: dent48, index: 48 },
    { image: dent47, index: 47 },
    { image: dent46, index: 46 },
    { image: dent45, index: 45 },
    { image: dent44, index: 44 },
    { image: dent43, index: 43 },
    { image: dent42, index: 42 },
    { image: dent41, index: 41 },
    { image: dent41, index: 31 },
    { image: dent42, index: 32 },
    { image: dent43, index: 33 },
    { image: dent44, index: 34 },
    { image: dent45, index: 35 },
    { image: dent46, index: 36 },
    { image: dent47, index: 37 },
    { image: dent48, index: 38 },
  ];

  return (
    <div className="flex-col align-middle mt-3">
      <div className="space-y-6">
        {/* imgUp */}
        <div
          className={`flex space-x-2 ${
            isReadOnly || isUpperArchDisabled ? "pointer-events-none" : ""
          }`}
        >
          {imgsUp.map((img) => (
            <div
              key={img.index}
              className={`${isSelected(img.index) ? "scale-125 selected" : ""} 
                ${
                  !isReadOnly && !isUpperArchDisabled
                    ? "hover:scale-125 hover:duration-200 duration-500"
                    : ""
                }
                ${isUpperArchDisabled ? "opacity-50" : ""}`}
              onClick={() => handleClick(img.index, true)}
            >
              <p>{img.index}</p>
              <img
                src={img.image}
                alt={`Tooth ${img.index}`}
                className="h-16 w-auto"
              />
            </div>
          ))}
        </div>

        {/* imgDown */}
        <div
          className={`flex space-x-2 mb-3 ${
            isReadOnly || isLowerArchDisabled ? "pointer-events-none" : ""
          }`}
        >
          {imgsDown.map((img) => (
            <div
              key={img.index}
              className={`${isSelected(img.index) ? "scale-125 selected" : ""} 
                ${
                  !isReadOnly && !isLowerArchDisabled
                    ? "hover:scale-125 hover:duration-200 duration-500"
                    : ""
                }
                ${isLowerArchDisabled ? "opacity-50" : ""}`}
              onClick={() => handleClick(img.index, false)}
            >
              <img
                src={img.image}
                alt={`Tooth ${img.index}`}
                className="h-16 w-auto"
              />
              <p>{img.index}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dents;

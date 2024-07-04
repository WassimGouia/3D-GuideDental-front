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
import { useEffect, useState } from "react";

interface DentsProps {
  selectAll: boolean;
  onToothClick?: (index: number) => void;
  onTeethSelectionChange?: (selectedTeeth: number[]) => void;
  selectedTeethData?: number[];
  isReadOnly?: boolean;
}

interface Images {
  image: string;
  index: number;
}

const Dents: React.FC<DentsProps> = ({
  selectAll,
  onToothClick,
  selectedTeethData = [],
  onTeethSelectionChange,
  isReadOnly = false,
}) => {
  const [selectedImagesUp, setSelectedImagesUp] = useState<number[]>(
    selectedTeethData.filter((index) => index <= 28)
  );
  const [selectedImagesDown, setSelectedImagesDown] = useState<number[]>(
    selectedTeethData.filter((index) => index >= 31)
  );

  const isSelected = (index: number) =>
    selectedImagesUp.includes(index) || selectedImagesDown.includes(index);

  const handleClick = (index: number, isUpper: boolean) => {
    if (isReadOnly) return;

    if (isUpper) {
      if (selectedImagesDown.length > 0) return;

      if (selectAll) {
        if (selectedImagesUp.includes(index)) {
          setSelectedImagesUp([]);
        } else {
          setSelectedImagesUp(imgsUp.map((img) => img.index));
        }
      } else {
        if (selectedImagesUp.includes(index)) {
          setSelectedImagesUp(selectedImagesUp.filter((i) => i !== index));
        } else {
          setSelectedImagesUp([...selectedImagesUp, index]);
        }
      }
    } else {
      if (selectedImagesUp.length > 0) return;

      if (selectAll) {
        if (selectedImagesDown.includes(index)) {
          setSelectedImagesDown([]);
        } else {
          setSelectedImagesDown(imgsDown.map((img) => img.index));
        }
      } else {
        if (selectedImagesDown.includes(index)) {
          setSelectedImagesDown(selectedImagesDown.filter((i) => i !== index));
        } else {
          setSelectedImagesDown([...selectedImagesDown, index]);
        }
      }
    }

    if (onToothClick) onToothClick(index);

    const newSelectedTeeth = [...selectedImagesUp, ...selectedImagesDown];
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
  const notifyParentOfSelection = () => {
    onTeethSelectionChange?.(selectedTeethData);
  };

  useEffect(() => {
    notifyParentOfSelection();
  }, [selectedTeethData, onTeethSelectionChange]);
  
  useEffect(() => {
    onTeethSelectionChange?.([...selectedImagesUp, ...selectedImagesDown]);
  }, [selectedImagesUp, selectedImagesDown, onTeethSelectionChange]);

  return (
    <div className="flex-col align-middle mt-3">
      <div className="space-y-6">
        {/* imgUp */}
        <div
          className={`flex space-x-2 ${
            isReadOnly ? "pointer-events-none" : ""
          }`}
        >
          {imgsUp.map((img) => (
            <div
              key={img.index}
              className={`${
                isSelected(img.index) ? "scale-125 selected" : ""
              } ${
                !isReadOnly &&
                !selectedTeethData.some((i) =>
                  imgsDown.map((img) => img.index).includes(i)
                )
                  ? "hover:scale-125 hover:duration-200 duration-500"
                  : ""
              }`}
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
            isReadOnly ? "pointer-events-none" : ""
          }`}
        >
          {imgsDown.map((img) => (
            <div
              key={img.index}
              className={`${
                isSelected(img.index) ? "scale-125 selected" : ""
              } ${
                !isReadOnly &&
                !selectedTeethData.some((i) =>
                  imgsUp.map((img) => img.index).includes(i)
                )
                  ? "hover:scale-125 hover:duration-200 duration-500"
                  : ""
              }`}
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

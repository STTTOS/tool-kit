import JSZip from "jszip";
import { FileInfo } from "../App";

export const getRandomInt = (min: number, max: number) => {
  if (min > max) throw new Error("min cannot greater than max");

  const step = max - min + 1;
  return Math.floor(Math.random() * step) + min;
};

export async function downloadAndZipImages(files: FileInfo[]) {
  const urlSet = new Map<string, number>()

  const imageBlobs = await Promise.all(
    files
    .map(({ url, ...props }) => {
      if (urlSet.has(url)) {
        const index = (urlSet.get(url) || 0) + 1
        urlSet.set(url, index)
        return { url: `${url}_${index}`, ...props }
      }

      urlSet.set(url, 1)
      return { url, ...props }
    })
    .map(async ({ url }) => {
      const response = await fetch(url);
      return await response.blob();
    })
  );

  const zip = new JSZip();
  imageBlobs.forEach((blob, index) => {
    zip.file(files[index].filename, blob);
  });

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const downloadLink = document.createElement("a");

  downloadLink.href = URL.createObjectURL(zipBlob);
  downloadLink.download = "images.zip";
  downloadLink.click();
}

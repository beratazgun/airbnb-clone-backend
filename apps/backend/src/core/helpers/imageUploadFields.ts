type TImageUploadFields = { name: string; maxCount: number };

export default function imageUploadFields(): TImageUploadFields[] {
  const maxImageCount = 100;
  const uploadFields: TImageUploadFields[] = [];

  for (let i = 1; i <= maxImageCount; i++) {
    uploadFields.push({ name: `image-${i}`, maxCount: 1 });
  }

  return uploadFields;
}

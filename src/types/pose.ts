/* Type definitions (Pose, SequenceItem, SavedSequence) */

export interface Pose {
  image_filename: string;
  category: string;
  name_en: string;
  name_zh_hk: string;
  sanskrit_name: string;
  is_free: boolean;
}

export interface SequenceItem extends Pose {
  instanceId: string;
  durationSeconds: number;
}

export interface SavedSequence {
  id: string;
  title: string;
  items: SequenceItem[];
  createdAt: string;
}
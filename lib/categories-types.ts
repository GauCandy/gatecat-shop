export type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  parentId: string | null;
};

export type CategoryNode = Category & { children: CategoryNode[] };

export class HashTag {
   constructor(public name: string, public count: number) {}

   static extractHashtags(content: string): string[] {
      const hashtags = content.match(/#\w+/g) || [];
      return hashtags.map((tag) => tag.slice(1).toLowerCase());
   }
}

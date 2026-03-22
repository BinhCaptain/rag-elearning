export declare class CreateLessonDto {
    courseId: string;
    title: string;
    content?: string;
    videoUrl?: string;
    order?: number;
}
export declare class UpdateLessonDto {
    title?: string;
    content?: string;
    videoUrl?: string;
    order?: number;
}

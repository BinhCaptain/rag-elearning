export declare class NestedOptionDto {
    content: string;
    isCorrect?: boolean;
}
export declare class NestedQuestionDto {
    content: string;
    explanation?: string;
    options: NestedOptionDto[];
}
export declare class NestedQuizDto {
    title: string;
    questions: NestedQuestionDto[];
}
export declare class CreateLessonDto {
    courseId: string;
    title: string;
    content?: string;
    videoUrl?: string;
    order?: number;
    quiz?: NestedQuizDto;
}
export declare class UpdateLessonDto {
    title?: string;
    content?: string;
    videoUrl?: string;
    order?: number;
    quiz?: NestedQuizDto;
}

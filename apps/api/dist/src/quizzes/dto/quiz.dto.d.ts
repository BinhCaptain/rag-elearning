export declare class CreateOptionDto {
    content: string;
    isCorrect?: boolean;
}
export declare class CreateQuestionDto {
    content: string;
    explanation?: string;
    options: CreateOptionDto[];
}
export declare class CreateQuizDto {
    lessonId: string;
    title: string;
    questions: CreateQuestionDto[];
}
export declare class SubmitQuizDto {
    answers: string[];
}

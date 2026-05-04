import QuizSidebar from "@/components/quiz/QuizSidebar"
import { Article } from "@/types"

export function articleHasSidebar(article: Article): boolean {
  if (!article.featuredQuiz) return false
  const pos = article.quizPosition || "inline"
  return pos === "sidebar" || pos === "both"
}

export function shouldRenderQuizInline(article: Article): boolean {
  if (!article.featuredQuiz) return false
  const pos = article.quizPosition || "inline"
  return pos === "inline" || pos === "both"
}

interface Props {
  article: Article
}

export default function ArticleSidebar({ article }: Props) {
  const showQuiz =
    !!article.featuredQuiz &&
    (article.quizPosition === "sidebar" || article.quizPosition === "both")

  if (!showQuiz) return null

  return (
    <aside>
      <div className="lg:sticky lg:top-6 flex flex-col gap-4">
        {showQuiz && article.featuredQuiz && (
          <QuizSidebar quiz={article.featuredQuiz} />
        )}
      </div>
    </aside>
  )
}

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuizForm from "../components/quizzes/QuizForm";
import { useProfileRole } from "../auth/useProfileRole";
import { Box, Spinner } from "@chakra-ui/react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

export default function InstructorQuizEdit() {
  const { courseId, quizId } = useParams();
  const { role, loading: loadingRole } = useProfileRole();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchQuiz() {
      setLoading(true);
      // Fetch quiz
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single();
      if (error || !data || data.course_id !== courseId) {
        setQuiz(null);
        setLoading(false);
        return;
      }
      // Fetch questions
      const { data: questions, error: qerr } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("order", { ascending: true });
      setQuiz({
        ...data,
        questions: questions || [],
      });
      setLoading(false);
    }
    if (quizId) fetchQuiz();
  }, [quizId, courseId]);

  if (loadingRole || loading) return <Spinner p={10} />;
  if (role !== "instructor")
    return <Box p={8} color="red.500">Access denied. Instructors only.</Box>;
  if (!quiz)
    return <Box p={8} color="red.500">Quiz not found or inaccessible.</Box>;

  const handleSave = async (nextQuiz) => {
    setSaving(true);
    // Update quiz
    const { title, description, published, time_limit, questions } = nextQuiz;
    const { error: quizErr } = await supabase
      .from("quizzes")
      .update({
        title,
        description,
        published,
        time_limit,
      })
      .eq("id", quizId);
    if (quizErr) throw quizErr;
    // Replace questions for simplicity
    await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);
    const questionsInsert = questions.map((q, idx) => ({
      quiz_id: quizId,
      text: q.text,
      type: q.type,
      options: q.options,
      correct_answers: q.correct_answers,
      points: q.points,
      order: idx + 1,
    }));
    const { error: qErr } = await supabase.from("quiz_questions").insert(questionsInsert);
    if (qErr) throw qErr;
    navigate(`/instructor/courses/${courseId}/quizzes`);
  };

  return (
    <Box maxW="900px" m="0 auto" p={8}>
      <QuizForm
        initialQuiz={quiz}
        onSave={handleSave}
        onCancel={() => navigate(`/instructor/courses/${courseId}/quizzes`)}
        loading={saving}
        isEdit={true}
        allowPublish={true}
      />
    </Box>
  );
}

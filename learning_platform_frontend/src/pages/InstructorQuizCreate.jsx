import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuizForm from "../components/quizzes/QuizForm";
import { useProfileRole } from "../auth/useProfileRole";
import { Box, Spinner } from "@chakra-ui/react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

export default function InstructorQuizCreate() {
  const { courseId } = useParams();
  const { role, loading: loadingRole } = useProfileRole();
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  if (loadingRole) return <Spinner p={10} />;

  if (role !== "instructor")
    return <Box p={8} color="red.500">Access denied. Instructors only.</Box>;

  const handleSave = async (quiz) => {
    setSaving(true);
    const { title, description, published, time_limit, questions } = quiz;
    // Insert quiz, then questions
    const { data: quizData, error: quizErr } = await supabase
      .from("quizzes")
      .insert([
        {
          title,
          description,
          published,
          time_limit,
          course_id: courseId,
        },
      ])
      .select()
      .single();
    if (quizErr) throw quizErr;
    const quizId = quizData.id;
    // Insert all questions
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
        initialQuiz={null}
        onSave={handleSave}
        onCancel={() => navigate(`/instructor/courses/${courseId}/quizzes`)}
        loading={saving}
        isEdit={false}
        allowPublish={true}
      />
    </Box>
  );
}

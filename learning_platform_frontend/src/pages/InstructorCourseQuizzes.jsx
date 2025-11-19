import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProfileRole } from "../auth/useProfileRole";
import { Box, Heading, Button, Spinner, Card, Text, HStack, Tag } from "@chakra-ui/react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

export default function InstructorCourseQuizzes() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useProfileRole();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roleLoading && role !== "instructor") {
      navigate("/notfound", { replace: true });
    }
  }, [role, roleLoading, navigate]);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    supabase
      .from("quizzes")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError("Failed to load quizzes");
        } else {
          setQuizzes(data ?? []);
        }
        setLoading(false);
      });
  }, [courseId]);

  if (roleLoading || loading) {
    return (
      <Box p={12} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }
  if (error) {
    return (
      <Box p={12} textAlign="center" color="red.500">
        {error}
      </Box>
    );
  }
  return (
    <Box maxW="900px" m="0 auto" py={6} px={4}>
      <HStack mb={2}>
        <Heading size="lg" color="blue.700">
          Course Quizzes
        </Heading>
        <Button
          as={Link}
          to={`/instructor/courses/${courseId}/quizzes/new`}
          colorScheme="blue"
          ml="auto"
        >
          Create Quiz
        </Button>
      </HStack>
      {quizzes.length === 0 ? (
        <Text color="gray.500" mt={8}>No quizzes found for this course.</Text>
      ) : (
        quizzes.map((quiz) => (
          <Card key={quiz.id} mb={4} p={4} bg="white" borderRadius="lg" boxShadow="md">
            <HStack justify="space-between">
              <Box>
                <Text fontWeight="bold" fontSize="lg">{quiz.title}</Text>
                <Text color="gray.600" fontSize="sm" maxW="500px">{quiz.description}</Text>
                <Text fontSize="sm" color="gray.500">
                  Time Limit: {quiz.time_limit} min
                </Text>
                {quiz.published ? (
                  <Tag colorScheme="green" size="sm" mt={1}>Published</Tag>
                ) : (
                  <Tag colorScheme="gray" size="sm" mt={1}>Draft</Tag>
                )}
              </Box>
              <Button
                as={Link}
                to={`/instructor/courses/${courseId}/quizzes/${quiz.id}/edit`}
                colorScheme="yellow"
              >
                Edit
              </Button>
            </HStack>
          </Card>
        ))
      )}
    </Box>
  );
}

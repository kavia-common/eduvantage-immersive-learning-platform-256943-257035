import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Card,
  Input,
  Textarea,
  Switch,
  Select,
  FormControl,
  FormLabel,
  FormErrorMessage,
  VStack,
  HStack,
  Text,
  IconButton,
  Divider,
  useToast,
  Tooltip,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, ArrowUpIcon, ArrowDownIcon } from "@chakra-ui/icons";
import { z } from "zod";

const quizSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  published: z.boolean().default(false),
  time_limit: z
    .number()
    .int()
    .min(1, "Must be at least 1 minute")
    .max(360, "Cannot be over 360 minutes"),
  questions: z
    .array(
      z.object({
        text: z.string().min(1, "Question text required"),
        type: z.enum(["single", "multiple"]),
        options: z
          .array(z.string().min(1, "Option can't be empty"))
          .min(2, "At least two options required"),
        correct_answers: z
          .array(z.number().int())
          .min(1, "At least one correct answer required"),
        points: z.number().int().min(1).max(100),
        order: z.number().int().min(1),
      })
    )
    .min(1, "At least one question"),
});

export function getQuizValidationError(values) {
  const parse = quizSchema.safeParse(values);
  if (!parse.success) {
    return parse.error;
  }
  return null;
}

// PUBLIC_INTERFACE
function QuizForm({
  initialQuiz,
  onSave,
  onCancel,
  loading,
  isEdit,
  allowPublish,
}) {
  /**
   * Props:
   * - initialQuiz: {title, description, published, time_limit, questions[]}
   * - onSave: async function to persist quiz
   * - onCancel: navigation or close function
   * - loading: if true, disables submit
   * - isEdit: true for edit mode, false for create
   * - allowPublish: controls display of publish toggle
   */
  const [quiz, setQuiz] = useState({
    title: initialQuiz?.title || "",
    description: initialQuiz?.description || "",
    published: initialQuiz?.published ?? false,
    time_limit: initialQuiz?.time_limit || 30,
    questions: initialQuiz?.questions || [],
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  // Form change handlers
  const handleChange = (field, value) => {
    setQuiz((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  // Questions handlers
  const addQuestion = () => {
    setQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: "",
          type: "single",
          options: ["", ""],
          correct_answers: [],
          points: 1,
          order: prev.questions.length + 1,
        },
      ],
    }));
    setDirty(true);
  };

  const updateQuestion = (idx, updated) => {
    const questions = [...quiz.questions];
    questions[idx] = { ...questions[idx], ...updated };
    setQuiz((prev) => ({ ...prev, questions }));
    setDirty(true);
  };

  const removeQuestion = (idx) => {
    const questions = quiz.questions.filter((_, qidx) => qidx !== idx);
    questions.forEach((q, i) => (q.order = i + 1)); // Resequence
    setQuiz((prev) => ({ ...prev, questions }));
    setDirty(true);
  };

  const moveQuestion = (idx, dir) => {
    const questions = [...quiz.questions];
    if (dir === "up" && idx > 0) {
      [questions[idx], questions[idx - 1]] = [questions[idx - 1], questions[idx]];
    }
    if (dir === "down" && idx < questions.length - 1) {
      [questions[idx], questions[idx + 1]] = [questions[idx + 1], questions[idx]];
    }
    questions.forEach((q, i) => (q.order = i + 1));
    setQuiz((prev) => ({ ...prev, questions }));
    setDirty(true);
  };

  // Option and correct answers management
  const setOption = (qIdx, optIdx, value) => {
    const qs = [...quiz.questions];
    const opts = [...qs[qIdx].options];
    opts[optIdx] = value;
    qs[qIdx].options = opts;
    setQuiz((prev) => ({ ...prev, questions: qs }));
    setDirty(true);
  };

  const addOption = (qIdx) => {
    const qs = [...quiz.questions];
    qs[qIdx].options.push("");
    setQuiz((prev) => ({ ...prev, questions: qs }));
    setDirty(true);
  };

  const removeOption = (qIdx, optIdx) => {
    const qs = [...quiz.questions];
    const opts = [...qs[qIdx].options];
    opts.splice(optIdx, 1);
    // Remove any selected correct_answer that pointed to this option
    let correct = qs[qIdx].correct_answers.filter((a) => a !== optIdx);
    // Decrement indices greater than optIdx
    correct = correct.map((a) => (a > optIdx ? a - 1 : a));
    qs[qIdx].options = opts;
    qs[qIdx].correct_answers = correct;
    setQuiz((prev) => ({ ...prev, questions: qs }));
    setDirty(true);
  };

  const toggleCorrect = (qIdx, optIdx) => {
    const qs = [...quiz.questions];
    const q = qs[qIdx];
    if (q.type === "single") {
      q.correct_answers = [optIdx];
    } else {
      if (q.correct_answers.includes(optIdx)) {
        q.correct_answers = q.correct_answers.filter((a) => a !== optIdx);
      } else {
        q.correct_answers.push(optIdx);
      }
    }
    qs[qIdx] = { ...q };
    setQuiz((prev) => ({ ...prev, questions: qs }));
    setDirty(true);
  };

  // Validation
  const validate = useCallback(() => {
    const parse = quizSchema.safeParse(quiz);
    if (!parse.success) {
      // Top level errors
      const errMap = {};
      for (const e of parse.error.issues) {
        if (e.path.length === 0) continue;
        // Only handle one-depth errors; for deep, use recursive mapping
        if (e.path[0] === "questions" && typeof e.path[1] === "number") {
          const idx = e.path[1];
          errMap.questions ??= {};
          errMap.questions[idx] = errMap.questions[idx] || {};
          errMap.questions[idx][e.path.slice(2).join(".") || e.path[2]] =
            e.message;
        } else {
          errMap[e.path[0]] = e.message;
        }
      }
      setErrors(errMap);
      return false;
    }
    setErrors({});
    return true;
  }, [quiz]);

  useEffect(() => {
    if (dirty) validate();
    // eslint-disable-next-line
  }, [quiz]);

  useEffect(() => {
    const beforeUnload = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes.";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  // On navigation attempt, confirm if unsaved
  useEffect(() => {
    const handleNav = (e) => {
      if (dirty && !window.confirm("You have unsaved changes. Leave anyway?")) {
        e.preventDefault();
      }
    };
    window.addEventListener("popstate", handleNav);
    return () => window.removeEventListener("popstate", handleNav);
  }, [dirty]);

  // Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      title: true,
      description: true,
      time_limit: true,
      questions: quiz.questions.map(() => ({})),
    });
    if (!validate()) {
      toast({
        title: "Validation Error",
        description: "Please fix errors before submitting.",
        status: "error",
        duration: 3000,
      });
      return;
    }
    setSubmitting(true);
    try {
      await onSave(quiz);
      setDirty(false);
      toast({
        title: isEdit ? "Quiz updated!" : "Quiz created!",
        status: "success",
      });
    } catch (err) {
      toast({
        title: "Error saving quiz",
        description:
          err?.message ||
          "There was an error saving your quiz. Please try again.",
        status: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Render
  return (
    <Card maxW="800px" m="0 auto" p={8} bg="white" borderRadius="xl" boxShadow="lg">
      <form onSubmit={handleSubmit}>
        <VStack align="stretch" spacing={6}>
          <FormControl isInvalid={!!errors.title && touched.title}>
            <FormLabel htmlFor="quiz-title">Quiz Title</FormLabel>
            <Input
              id="quiz-title"
              value={quiz.title}
              onChange={(e) => handleChange("title", e.target.value)}
              isRequired
              onBlur={() => setTouched((t) => ({ ...t, title: true }))}
              size="lg"
              autoFocus
              bg="gray.50"
            />
            <FormErrorMessage>{errors.title}</FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={quiz.description}
              onChange={(e) => handleChange("description", e.target.value)}
              maxLength={512}
              resize="vertical"
              rows={3}
              bg="gray.50"
            />
          </FormControl>
          <FormControl isInvalid={!!errors.time_limit && touched.time_limit}>
            <FormLabel>Time Limit (minutes)</FormLabel>
            <Input
              type="number"
              min={1}
              max={360}
              value={quiz.time_limit}
              onChange={(e) =>
                handleChange("time_limit", parseInt(e.target.value, 10) || 1)
              }
              onBlur={() => setTouched((t) => ({ ...t, time_limit: true }))}
              w="120px"
              bg="gray.50"
            />
            <FormErrorMessage>{errors.time_limit}</FormErrorMessage>
          </FormControl>
          {allowPublish && (
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="publish-toggle" mb="0">
                Published
              </FormLabel>
              <Switch
                id="publish-toggle"
                isChecked={quiz.published}
                onChange={(e) => handleChange("published", e.target.checked)}
                colorScheme="blue"
              />
            </FormControl>
          )}
          <Divider />
          <VStack align="stretch" spacing={4}>
            <HStack>
              <Text as="h2" fontWeight="bold" fontSize="lg" color="blue.700">
                Questions
              </Text>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                onClick={addQuestion}
                variant="solid"
                size="sm"
                ml="auto"
                aria-label="Add new question"
              >
                Add Question
              </Button>
            </HStack>
            {errors.questions && typeof errors.questions === "string" && (
              <Text color="red.500">{errors.questions}</Text>
            )}
            {quiz.questions.map((q, idx) => (
              <Card
                key={`q${idx}`}
                bg="gray.50"
                borderRadius="lg"
                p={4}
                mb={2}
                borderLeft="4px solid"
                borderColor="blue.300"
                boxShadow="sm"
              >
                <VStack align="stretch" spacing={2}>
                  <HStack>
                    <Text fontWeight="bold" fontSize="md">
                      Q{idx + 1}
                    </Text>
                    <Tooltip label="Move up">
                      <IconButton
                        icon={<ArrowUpIcon />}
                        size="xs"
                        isDisabled={idx === 0}
                        onClick={() => moveQuestion(idx, "up")}
                        aria-label="Move up"
                      />
                    </Tooltip>
                    <Tooltip label="Move down">
                      <IconButton
                        icon={<ArrowDownIcon />}
                        size="xs"
                        isDisabled={idx === quiz.questions.length - 1}
                        onClick={() => moveQuestion(idx, "down")}
                        aria-label="Move down"
                      />
                    </Tooltip>
                    <Tooltip label="Delete">
                      <IconButton
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        variant="ghost"
                        size="xs"
                        onClick={() => removeQuestion(idx)}
                        aria-label="Delete question"
                      />
                    </Tooltip>
                  </HStack>
                  <FormControl
                    isInvalid={
                      !!errors.questions?.[idx]?.text && touched.questions?.[idx]?.text
                    }
                  >
                    <FormLabel>Question Text</FormLabel>
                    <Input
                      value={q.text}
                      onChange={(e) =>
                        updateQuestion(idx, { text: e.target.value })
                      }
                      onBlur={() =>
                        setTouched((t) => ({
                          ...t,
                          questions: [
                            ...(t.questions || []),
                            { ...((t.questions || [])[idx] || {}), text: true },
                          ],
                        }))
                      }
                      bg="white"
                    />
                    <FormErrorMessage>
                      {errors.questions?.[idx]?.text}
                    </FormErrorMessage>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Type</FormLabel>
                    <Select
                      value={q.type}
                      onChange={(e) =>
                        updateQuestion(idx, { type: e.target.value })
                      }
                      aria-label="Question type"
                      maxW="180px"
                    >
                      <option value="single">Single Choice</option>
                      <option value="multiple">Multiple Choice</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Options</FormLabel>
                    <VStack align="stretch" spacing={1}>
                      {q.options.map((opt, optIdx) => (
                        <HStack key={`q${idx}-opt${optIdx}`}>
                          <Input
                            value={opt}
                            onChange={(e) =>
                              setOption(idx, optIdx, e.target.value)
                            }
                            placeholder={`Option ${optIdx + 1}`}
                            aria-label={`Option ${optIdx + 1}`}
                            bg="white"
                          />
                          <Switch
                            colorScheme="green"
                            isChecked={q.correct_answers.includes(optIdx)}
                            onChange={() => toggleCorrect(idx, optIdx)}
                            aria-label={
                              q.type === "single"
                                ? "Mark as correct"
                                : "Toggle correct option"
                            }
                            isDisabled={
                              q.type === "single" &&
                              q.correct_answers.length === 1 &&
                              !q.correct_answers.includes(optIdx)
                            }
                          />
                          <Text fontSize="sm">Correct</Text>
                          <IconButton
                            icon={<DeleteIcon />}
                            size="xs"
                            colorScheme="red"
                            onClick={() => removeOption(idx, optIdx)}
                            isDisabled={q.options.length <= 2}
                            aria-label="Delete option"
                          />
                        </HStack>
                      ))}
                      <Button
                        leftIcon={<AddIcon />}
                        size="xs"
                        variant="outline"
                        w="fit-content"
                        onClick={() => addOption(idx)}
                        aria-label="Add option"
                      >
                        Add Option
                      </Button>
                      {errors.questions?.[idx]?.options && (
                        <Text color="red.500">{errors.questions[idx].options}</Text>
                      )}
                      {errors.questions?.[idx]?.correct_answers && (
                        <Text color="red.500">
                          {errors.questions[idx].correct_answers}
                        </Text>
                      )}
                    </VStack>
                  </FormControl>
                  <HStack>
                    <FormControl
                      isInvalid={
                        !!errors.questions?.[idx]?.points && touched.questions?.[idx]?.points
                      }
                    >
                      <FormLabel>Points</FormLabel>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={q.points}
                        onChange={(e) =>
                          updateQuestion(idx, {
                            points: parseInt(e.target.value, 10) || 1,
                          })
                        }
                        onBlur={() =>
                          setTouched((t) => ({
                            ...t,
                            questions: [
                              ...(t.questions || []),
                              { ...((t.questions || [])[idx] || {}), points: true },
                            ],
                          }))
                        }
                        w="80px"
                      />
                      <FormErrorMessage>
                        {errors.questions?.[idx]?.points}
                      </FormErrorMessage>
                    </FormControl>
                    <Text color="gray.500" fontSize="sm" ml={1}>
                      Order: {q.order}
                    </Text>
                  </HStack>
                </VStack>
              </Card>
            ))}
          </VStack>
          <Divider />
          <HStack spacing={4} mt={2} justify="flex-end">
            <Button variant="ghost" onClick={onCancel} isDisabled={submitting}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={submitting || loading}
              isDisabled={submitting || loading}
            >
              {isEdit ? "Update Quiz" : "Create Quiz"}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Card>
  );
}

QuizForm.propTypes = {
  initialQuiz: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  isEdit: PropTypes.bool,
  allowPublish: PropTypes.bool,
};

export default QuizForm;

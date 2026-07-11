import { useMutation } from "@tanstack/react-query";
import { createProgram, type CreateProgramInput } from "../api/programApi";

export function useCreateProgram() {
  return useMutation({ mutationFn: (input: CreateProgramInput) => createProgram(input) });
}

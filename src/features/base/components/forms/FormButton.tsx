import { Button, type ButtonProps } from "@chakra-ui/react";

interface FormButtonProps extends ButtonProps {
  isValid?: boolean;
  loading?: boolean;
}

export function FormButton({
  isValid = true,
  loading,
  children,
  ...props
}: FormButtonProps) {
  return (
    <Button
      type="submit"
      variant="surface"
      loading={loading}
      disabled={!isValid || loading}
      mt={6}
      w="full"
      opacity={isValid ? 1 : 0.72}
      filter={isValid ? "saturate(1)" : "saturate(0.72)"}
      transition="opacity 0.24s ease, filter 0.24s ease, transform 0.16s ease, box-shadow 0.16s ease, background-color 0.24s ease, border-color 0.24s ease"
      _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
      _active={{ transform: "translateY(0)" }}
      _disabled={{
        opacity: 0.72,
        filter: "saturate(0.72)",
        cursor: "not-allowed",
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
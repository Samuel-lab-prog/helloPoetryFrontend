import { Text } from "@chakra-ui/react";
import { FormField, FieldContainer, FormCard, FormButton } from "@features/base";
import { useLoginForm } from "../hooks/useLoginForm";
import type { LoginDataType } from "../schemas/loginSchema";

type Field = {
  name: keyof LoginDataType;
  label: string;
  required?: boolean;
  autoFocus?: boolean;
  type?: string;
};

const fields: Field[] = [
  {
    name: "email",
    label: "E-mail",
    required: true,
    autoFocus: true,
  },
  {
    name: "password",
    label: "Senha",
    required: true,
    type: "password",
  },
];

export function LoginForm() {
  const {
    handleSubmit,
    formState: { errors, isValid },
    onSubmit,
    isPending: loading,
    control,
    generalError,
  } = useLoginForm();

  return (
    <FormCard as="form" onSubmit={handleSubmit(onSubmit)}>
      {generalError && (
        <Text
          color="red.500"
          fontSize="sm"
          mb={2}
          animationName="shake-x, fade-in"
          animationDuration="240ms"
        >
          {generalError}
        </Text>
      )}

      {fields.map((field, i) => (
        <FieldContainer
          key={field.name}
          delay={40 + i * 80}
          hasError={Boolean(errors[field.name])}
        >
          <FormField
            {...field}
            control={control}
            error={errors[field.name]}
          />
        </FieldContainer>
      ))}

      <FormButton
        isValid={isValid}
        loading={loading}
      >
        Entrar
      </FormButton>
    </FormCard>
  );
}

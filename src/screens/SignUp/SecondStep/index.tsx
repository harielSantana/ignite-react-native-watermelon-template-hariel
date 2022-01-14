import { StackScreenProps } from "@react-navigation/stack";
import React from "react";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useTheme } from "styled-components";
import * as Yup from "yup";

import { BackButton } from "../../../components/BackButton";
import { api } from "../../../services/api";
import { RootStackParamList } from "../../../types/react-navigation/stack.routes";

import {
  ConfirmNewPasswordInput,
  Container,
  FinishRegisterButton,
  Form,
  FormTitle,
  Header,
  NewPasswordInput,
  ScrollableContainer,
  SignUpFirstStep,
  SignUpSecondStep,
  SignUpSteps,
  SubTitle,
  Title,
} from "./styles";

export interface SignUpSecondStepParams {
  user: {
    name: string;
    email: string;
    driverLicense: string;
  };
}

type Props = StackScreenProps<RootStackParamList, "SignUpSecondStep">;

export function SecondStep({ navigation, route }: Props) {
  const theme = useTheme();
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");

  const { user } = route.params;

  function handleGoBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }

  async function handleFinishRegister() {
    try {
      const schema = Yup.object().shape({
        newPassword: Yup.string().required("Senha é obrigatória"),
        newPasswordConfirmation: Yup.string()
          .required("Confirmação de senha é obrigatória")
          .equals(
            [Yup.ref("newPassword")],
            "A confirmação de senha precisa ser igual à senha"
          ),
      });

      const data = { newPassword, newPasswordConfirmation };
      await schema.validate(data, { abortEarly: false });

      // Enviar para API e Cadastrar
      await api.post("/users", {
        name: user.name,
        email: user.email,
        password: newPassword,
        driver_license: user.driverLicense,
      });

      navigation.navigate("Confirmation", {
        title: "Conta criada!",
        screenToNavigate: "SignIn",
        message: `Agora é só fazer login\ne aproveitar.`,
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return Alert.alert("Opa", error.errors.join("\n"));
      }

      return Alert.alert(
        "Erro na autenticação",
        "Ocorreu um erro ao fazer login, verifique as credenciais."
      );
    }
  }

  return (
    <Container>
      <Header>
        <BackButton onPress={handleGoBack} />

        <SignUpSteps>
          <SignUpFirstStep />
          <SignUpSecondStep active />
        </SignUpSteps>
      </Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollableContainer
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Title>
            Crie sua{"\n"}
            conta
          </Title>
          <SubTitle>
            Faça seu cadastro de{"\n"}
            forma rápida e fácil
          </SubTitle>

          <Form>
            <FormTitle>2. Senha</FormTitle>

            <NewPasswordInput
              placeholder="Senha"
              autoCorrect={false}
              autoCapitalize="none"
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <ConfirmNewPasswordInput
              placeholder="Repetir Senha"
              autoCorrect={false}
              autoCapitalize="none"
              value={newPasswordConfirmation}
              onChangeText={setNewPasswordConfirmation}
            />

            <FinishRegisterButton
              title="Cadastrar"
              color={theme.colors.success}
              onPress={handleFinishRegister}
            />
          </Form>
        </ScrollableContainer>
      </KeyboardAvoidingView>
    </Container>
  );
}

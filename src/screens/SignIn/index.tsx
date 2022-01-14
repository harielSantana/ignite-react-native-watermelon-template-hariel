import React, { useEffect, useState } from "react";
import { Alert, Platform, StatusBar } from "react-native";
import * as Yup from "yup";
import { StackScreenProps } from "@react-navigation/stack";

import { useAuth } from "../../hooks/auth";
import { database } from "../../database";

import { RootStackParamList } from "../../types/react-navigation/stack.routes";

import {
  KAV,
  ScrollableContainer,
  Header,
  Title,
  SubTitle,
  Footer,
  RegisterButton,
  LoginButton,
  Form,
  EmailInput,
  PasswordInput,
} from "./styles";

type Props = StackScreenProps<RootStackParamList, "SignIn">;

export function SignIn({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useAuth();

  async function handleSignIn() {
    try {
      const schema = Yup.object().shape({
        email: Yup.string()
          .required("E-mail obrigatório")
          .email("Digite um e-mail válido"),
        password: Yup.string().required("Senha obrigatória"),
      });

      await schema.validate({ email, password }, { abortEarly: false });

      signIn({ email, password });
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

  function handleRegister() {
    navigation.navigate("SignUpFirstStep");
  }

  useEffect(() => {
    async function loadData() {
      const userCollection = database.get("users");
      const users = await userCollection.query().fetch();
      console.log(users);
    }
    loadData();
  });

  return (
    <KAV behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollableContainer
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        <Header>
          <Title>
            Estamos{"\n"}
            quase lá.
          </Title>

          <SubTitle>
            Faça seu login para começar{"\n"}
            uma experiência incrível.
          </SubTitle>
        </Header>

        <Form>
          <EmailInput
            iconName="mail"
            placeholder="E-mail"
            keyboardType="email-address"
            autoCorrect={false}
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <PasswordInput
            placeholder="Senha"
            autoCorrect={false}
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />
        </Form>

        <Footer>
          <LoginButton title="Login" onPress={handleSignIn} />

          <RegisterButton
            title="Criar conta gratuita"
            onPress={handleRegister}
          />
        </Footer>
      </ScrollableContainer>
    </KAV>
  );
}

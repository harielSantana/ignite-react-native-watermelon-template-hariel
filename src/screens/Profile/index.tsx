import React, { useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView } from "react-native";
import { useTheme } from "styled-components/native";
import { useNetInfo } from "@react-native-community/netinfo";
import { StackScreenProps } from "@react-navigation/stack";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";

import * as ImagePicker from "expo-image-picker";
import * as Yup from "yup";

import { useAuth } from "../../hooks/auth";
import { RootStackParamList } from "../../types/react-navigation/stack.routes";

import { BackButton } from "../../components/BackButton";
import { Input } from "../../components/Input";
import { ProtectedInput } from "../../components/ProtectedInput";
import { Button } from "../../components/Button";

import {
  Container,
  Header,
  HeaderTop,
  HeaderTitle,
  LogoutButton,
  PhotoContainer,
  Photo,
  PhotoButton,
  Content,
  Options,
  Option,
  OptionTitle,
  Section,
} from "./styles";

type Props = StackScreenProps<RootStackParamList, "Profile">;

export function Profile({ navigation }: Props) {
  const { user, signOut, updatedUser } = useAuth();

  const [option, setOption] = useState<"dataEdit" | "passwordEdit">("dataEdit");
  const [avatar, setAvatar] = useState(user.avatar);
  const [name, setName] = useState(user.name);
  const [driverLicense, setDriverLicense] = useState(user.driver_license);

  const theme = useTheme();
  const netInfo = useNetInfo();

  function handleGoBack() {
    if (navigation.canGoBack()) navigation.goBack();
  }

  function handleOptionChange(optionSelected: "dataEdit" | "passwordEdit") {
    if (netInfo.isConnected === false && optionSelected === "passwordEdit") {
      Alert.alert(
        "Você está Offline",
        "Para mudar a senha, conecte-se a internet"
      );
    } else {
      setOption(optionSelected);
    }
  }

  async function handleAvatarSelect() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.cancelled) {
      setAvatar(result.uri);
    }
  }

  async function handleProfileUpdate() {
    try {
      const schema = Yup.object().shape({
        driverLicense: Yup.string().required("CNH é obrigatória"),
        name: Yup.string().required("Nome é obrigatório"),
      });

      const data = { name, driverLicense };
      await schema.validate(data);

      await updatedUser({
        id: user.id,
        user_id: user.user_id,
        name,
        email: user.email,
        driver_license: user.driver_license,
        avatar,
        token: user.token,
      });

      Alert.alert("Perfil atualizado com sucesso!");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        Alert.alert("Opa", error.message);
      } else {
        Alert.alert("Não foi possível atualizar o perfil");
      }
    }
  }

  async function handleSignOut() {
    Alert.alert(
      "Tem certeza?",
      "Se você sair vai precisar de internet para conectar novamente.",
      [
        { text: "Cancelar", onPress: () => {} },
        { text: "Sair", onPress: () => signOut() },
      ]
    );
  }

  return (
    <KeyboardAvoidingView behavior="position" enabled>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Container>
          <Header>
            <HeaderTop>
              <BackButton color={theme.colors.shape} onPress={handleGoBack} />
              <HeaderTitle>Editar Perfil</HeaderTitle>
              <LogoutButton onPress={handleSignOut}>
                <Feather name="power" size={24} color={theme.colors.shape} />
              </LogoutButton>
            </HeaderTop>

            <PhotoContainer>
              {!!avatar && <Photo source={{ uri: avatar }} />}
              <PhotoButton onPress={() => handleAvatarSelect()}>
                <Feather name="camera" size={24} color={theme.colors.shape} />
              </PhotoButton>
            </PhotoContainer>
          </Header>

          <Content style={{ marginBottom: useBottomTabBarHeight() }}>
            <Options>
              <Option
                active={option === "dataEdit"}
                onPress={() => handleOptionChange("dataEdit")}
              >
                <OptionTitle active={option === "dataEdit"}>Dados</OptionTitle>
              </Option>
              <Option
                active={option === "passwordEdit"}
                onPress={() => handleOptionChange("passwordEdit")}
              >
                <OptionTitle active={option === "passwordEdit"}>
                  Trocar Senha
                </OptionTitle>
              </Option>
            </Options>
            {option === "dataEdit" ? (
              <Section>
                <Input
                  iconName="user"
                  placeholder={user ? user.name : "Nome"}
                  autoCorrect={false}
                  value={name}
                  onChangeText={setName}
                />
                <Input
                  iconName="mail"
                  placeholder={user.email}
                  editable={false}
                  value={user.email}
                />
                <Input
                  iconName="credit-card"
                  placeholder={user ? user.driver_license : "CNH"}
                  keyboardType="numeric"
                  value={driverLicense}
                  onChangeText={setDriverLicense}
                />
              </Section>
            ) : (
              <Section>
                <ProtectedInput placeholder="Senha Atual" autoCorrect={false} />
                <ProtectedInput placeholder="Nova Senha" autoCorrect={false} />
                <ProtectedInput
                  placeholder="Confirmar Senha"
                  autoCorrect={false}
                />
              </Section>
            )}
            <Button
              title="Salvar as alterações"
              onPress={handleProfileUpdate}
            />
          </Content>
        </Container>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

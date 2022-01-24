import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, StatusBar } from "react-native";

import { useTheme } from "styled-components";
import { RFValue } from "react-native-responsive-fontsize";
import { StackScreenProps } from "@react-navigation/stack";
import { useNetInfo } from "@react-native-community/netinfo";
import { synchronize } from "@nozbe/watermelondb/sync";

import { api } from "../../services/api";
import { database } from "../../database";
import { RootStackParamList } from "../../types/react-navigation/stack.routes";

import { Car } from "../../components/Car";
import { LoadAnimation } from "../../components/LoadAnimation";

import Logo from "../../assets/logo.svg";

import { CarList, Container, Header, HeaderContent, TotalCars } from "./styles";
import { Car as ModelCar } from "../../database/model/Car";
import { CarDTO } from "../../dtos/CarDTO";

type Props = StackScreenProps<RootStackParamList, "Home">;

export function Home({ navigation }: Props) {
  const [cars, setCars] = useState<ModelCar[]>([]);
  const [loading, setLoading] = useState(true);

  const synchronizing = useRef(false);
  const netInfo = useNetInfo();

  function handleCarDetails(car: CarDTO) {
    navigation.navigate("CarDetails", { car });
  }

  useEffect(() => {
    let isMounted = true;

    async function fetchCars() {
      try {
        const carCollection = database.get<ModelCar>("cars");
        const carsList = await carCollection.query().fetch();

        if (isMounted) {
          setCars(carsList);
        }
      } catch (error) {
        console.log("Home Fetch", (error as Error).message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCars();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const syncChanges = async () => {
      if (netInfo.isConnected && !synchronizing.current) {
        synchronizing.current = true;
        try {
          await synchronize({
            database,
            pullChanges: async ({ lastPulledAt }) => {
              const response = await api.get(
                `cars/sync/pull?lastPulledVersion=${lastPulledAt || 0}`
              );

              const { changes, latestVersion } = response.data;
              return { changes, timestamp: latestVersion };
            },
            pushChanges: async ({ changes }) => {
              const user = changes.users;

              await api.post("/users/sync", user);
            },
          });
        } catch (error) {
          console.log("Home", (error as Error).message);
        } finally {
          synchronizing.current = false;
        }
      }
    };
    syncChanges();
  }, [netInfo.isConnected]);

  return (
    <Container>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <Header>
        <HeaderContent>
          <Logo width={RFValue(108)} height={RFValue(12)} />

          <TotalCars>
            {loading ? `Buscando carros...` : `Total de ${cars.length} carros`}
          </TotalCars>
        </HeaderContent>
      </Header>

      {loading ? (
        <LoadAnimation />
      ) : (
        <CarList
          data={cars}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Car data={item} onPress={() => handleCarDetails(item)} />
          )}
        />
      )}
    </Container>
  );
}

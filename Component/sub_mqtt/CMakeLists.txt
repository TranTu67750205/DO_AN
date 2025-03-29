idf_component_register(SRCS "sub_mqtt.c"
                    INCLUDE_DIRS "include"
                    REQUIRES sub_mqtt driver esp_partition nvs_flash esp_netif app_update mqtt )
                    
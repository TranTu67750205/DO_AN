idf_component_register(SRCS "Receive.c"
                    INCLUDE_DIRS "."
                    REQUIRES lora sub_mqtt wifi_config driver app_update esp_wifi json esp_partition nvs_flash esp_netif mqtt)

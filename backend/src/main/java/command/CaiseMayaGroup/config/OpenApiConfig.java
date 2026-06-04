package command.CaiseMayaGroup.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI caisseMayaOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CaisseMaya API")
                        .description("Cash register and sales management API for café operations")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("CaisseMaya Team")
                                .email("contact@caissemaya.com")));
    }
}

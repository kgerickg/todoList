package com.cloudsync.todo.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.FirebaseFirestore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.io.IOException;

/**
 * Firebase配置類
 */
@Configuration
public class FirebaseConfig {

    @Value("${firebase.service-account-file}")
    private Resource serviceAccount;

    /**
     * 初始化Firebase應用
     */
    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount.getInputStream()))
                    .build();

            return FirebaseApp.initializeApp(options);
        }
        return FirebaseApp.getInstance();
    }

    /**
     * 提供FirebaseAuth Bean
     */
    @Bean
    public FirebaseAuth firebaseAuth() throws IOException {
        return FirebaseAuth.getInstance(firebaseApp());
    }

    /**
     * 提供Firestore Bean
     */
    @Bean
    public FirebaseFirestore firestore() throws IOException {
        return FirebaseFirestore.getInstance(firebaseApp());
    }
}

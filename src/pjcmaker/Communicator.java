/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package pjcmaker;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import javax.swing.event.ChangeEvent;

/**
 *
 * @author gal
 */
class Communicator implements Runnable {

    Socket sock = null;
    private static final Communicator comm = new Communicator();
    private String PathOut;
    private final String[] serviceArgs = {"node", ""};
    private final String host = "127.0.0.1";
    private final int port = 6969;
    GUI gui = null;
    String BPin;
    String CodeIn;
    Process service;
    BufferedReader bf;

    @SuppressWarnings("empty-statement")
    private Communicator() {
        String ClassPath = System.getProperty("java.class.path");
        ClassPath = ClassPath.substring(0 , ClassPath.lastIndexOf("/"));
        serviceArgs[1] = ClassPath.substring(0 , ClassPath.lastIndexOf("/"));
        serviceArgs[1] += "/WaveFilterServer/main.js";
        System.out.println(serviceArgs[1]);
        try {
            service = new ProcessBuilder(serviceArgs).start();
            bf = new BufferedReader(new InputStreamReader(service.getInputStream()));
            while (!bf.ready());
            System.out.println(bf.readLine());
        } catch (IOException e) {
            e.printStackTrace();
        }
        Thread closeChildThread = new Thread() {
            public void run() {
                service.destroy();
            }
        };

        Runtime.getRuntime().addShutdownHook(closeChildThread);
        if (service.isAlive()) {
            try {
                this.sock = new Socket(host, port);
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        } else {
            System.out.println("have some pie");
        }
    }

    public static Communicator getIns() {
        return comm;
    }

    public void addListener(GUI gui) {
        this.gui = gui;
    }

    @Override
    public void run() {
        try {
            // out & in 
            PrintWriter out = new PrintWriter(sock.getOutputStream(), true);
            BufferedReader in = new BufferedReader(new InputStreamReader(sock.getInputStream()));
            
            // writes str in the socket and read
            out.println(this.PathOut);
            
            String[] res = in.readLine().split(" ");
            BPin = res[0];
            CodeIn = res[1];
            System.out.println(res[0]);
            System.out.println(res[1]);
            ChangeEvent evt = new ChangeEvent(this);
            gui.stateChanged(evt);
            
        } catch (IOException e) {
        }

    }

    void setRequestParam(String absolutePath) {
        this.PathOut = absolutePath;
    }
    
    public String getBpPath(){
        return this.BPin;
    }
    
    public String getCodePath(){
        return this.CodeIn;
    }
}

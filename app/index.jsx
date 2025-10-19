import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import Narwhal from '../assets/img/narwhal.png'
import {Link} from 'expo-router'

const Home = () => {
  return (
    <View style={styles.container}>
        <Image source={Narwhal} style={styles.img}></Image>
      <Text style={[styles.title, {color: 'green'}]}>The Number 1</Text>
      <Text style={{marginTop: 10, marginBottom: 30}}>
        Workout App
        </Text>

        <Link href="/about">About Page</Link>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18
    },
    img: {
        marginVertical: 20,
    },
    
})